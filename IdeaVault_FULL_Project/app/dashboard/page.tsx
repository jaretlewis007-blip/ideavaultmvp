"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { auth, db, storage } from "../../firebase/config";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  updateDoc,
  getDoc
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

/* ----------------------------------------------------
   TIME AGO FORMATTER
   Converts timestamps → "5m ago", "2h ago", "3d ago"
---------------------------------------------------- */
function timeAgo(timestamp: any) {
  if (!timestamp?.seconds) return "";

  const diff = (Date.now() - timestamp.seconds * 1000) / 1000;

  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ----------------------------------------------------
   COLOR-CODED BUSINESS THEMES
   Based on postType:
   idea → blue
   investor → gold
   marketplace → purple
   project → green
   legal → red
   trending → gold glow
---------------------------------------------------- */
const typeStyles: any = {
  idea: "border-blue-400/40 bg-blue-400/10",
  investor: "border-yellow-400/40 bg-yellow-400/10",
  marketplace: "border-purple-400/40 bg-purple-400/10",
  project: "border-green-400/40 bg-green-400/10",
  legal: "border-red-400/40 bg-red-400/10",
  trending: "border-yellow-300/60 bg-yellow-300/15 shadow-glow-gold"
};

/* ----------------------------------------------------
   BUSINESS REACTIONS — NOT EMOJIS
   These fit IdeaVault's business brand:
   💡 Insight
   💼 Professional
   🔍 Interested
   🤝 Partnership
   ⭐ Opportunity
---------------------------------------------------- */
const reactionList = [
  { icon: "💡", label: "Insight" },
  { icon: "💼", label: "Professional" },
  { icon: "🔍", label: "Interested" },
  { icon: "🤝", label: "Partnership" },
  { icon: "⭐", label: "Opportunity" }
];
export default function Dashboard() {
  const user = auth.currentUser;

  /* ----------------------------------------------------
     STATE MANAGEMENT
  ---------------------------------------------------- */
  const [role, setRole] = useState<string>("creator");
  const [postType, setPostType] = useState<string>("idea");
  const [postText, setPostText] = useState<string>("");
  const [postImage, setPostImage] = useState<any>(null);

  const [posts, setPosts] = useState<any[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<any[]>([]);
  const [lastPost, setLastPost] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const [category, setCategory] = useState<string>("all");

  /* Infinite scroll observer reference */
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* ----------------------------------------------------
     FETCH USER ROLE FROM FIRESTORE
  ---------------------------------------------------- */
  useEffect(() => {
    const loadRole = async () => {
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const userRole = snap.data().role || "creator";
        setRole(userRole);

        /* ------------------------------------------------
           ROLE-BASED DEFAULT POST TYPE
           creator   → "idea"
           investor  → "investor"
           vendor    → "marketplace"
           lawyer    → "legal"
           ceo       → "project" (**SPECIAL**)
        ------------------------------------------------ */
        if (userRole === "creator") setPostType("idea");
        else if (userRole === "investor") setPostType("investor");
        else if (userRole === "vendor") setPostType("marketplace");
        else if (userRole === "lawyer") setPostType("legal");
        else if (userRole === "ceo") setPostType("project");
      }
    };

    loadRole();
  }, [user]);

  /* ----------------------------------------------------
     POST TYPE DROPDOWN OPTIONS
     Users can switch freely (flexible system)
  ---------------------------------------------------- */
  const postTypeOptions = [
    { value: "idea", label: "💡 Idea" },
    { value: "investor", label: "💼 Investor Offer" },
    { value: "marketplace", label: "🔧 Marketplace Work" },
    { value: "project", label: "📈 Project Update" },
    { value: "legal", label: "🧾 Legal / NDA" }
  ];

  /* ----------------------------------------------------
     BUSINESS CATEGORIES (your chosen mix)
  ---------------------------------------------------- */
  const categories = [
    { id: "all", label: "All Activity" },
    { id: "idea", label: "Ideas" },
    { id: "investor", label: "Investor Offers" },
    { id: "marketplace", label: "Marketplace Work" },
    { id: "project", label: "Project Updates" },
    { id: "legal", label: "Legal / NDAs" },
    { id: "trending", label: "Trending" }
  ];
  /* ----------------------------------------------------
     CREATE POST — SEND TO FIRESTORE
  ---------------------------------------------------- */
  const createPost = async () => {
    if (!postText && !postImage) {
      alert("Write something or add an image.");
      return;
    }

    let imageUrl = null;

    /* Upload image if selected */
    if (postImage) {
      const path = `user_uploads/${user.uid}/posts/${Date.now()}_${postImage.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, postImage);
      imageUrl = await getDownloadURL(storageRef);
    }

    /* CEO AUTO-PIN LOGIC — Pinned for 24 hours */
    let pinnedUntil = null;
    if (role === "ceo") {
      pinnedUntil = Date.now() + 24 * 60 * 60 * 1000; // 24 hours ahead
    }

    /* Prepare document */
    await addDoc(collection(db, "posts"), {
      userId: user.uid,
      role: role,
      text: postText,
      imageUrl,
      type: postType,
      likes: [],
      reactions: [],
      comments: [],
      createdAt: serverTimestamp(),
      pinnedUntil: pinnedUntil,
    });

    setPostText("");
    setPostImage(null);
    alert("Posted!");
    window.location.reload();
  };

  /* ----------------------------------------------------
     CREATE POST UI CARD (Business Styled)
  ---------------------------------------------------- */
  const CreatePostBox = () => (
    <div className="card max-w-2xl mx-auto mt-16 p-6">
      {/* Header Row */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gold">Create Post</h2>

        {/* Small inline dropdown */}
        <select
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
          className="
            bg-black/40 border border-gold/40 text-gold 
            rounded-lg px-3 py-2 text-sm
          "
        >
          {postTypeOptions.map((type) => (
            <option key={type.value} value={type.value} className="bg-black text-white">
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Text Area */}
      <textarea
        className="input-glass h-24 text-white"
        placeholder="Share an idea, investor offer, update, or business progress..."
        value={postText}
        onChange={(e) => setPostText(e.target.value)}
      />

      {/* Image Upload */}
      <input
        type="file"
        className="mt-3"
        onChange={(e) => setPostImage(e.target.files![0])}
      />

      {/* Post Button */}
      <button
        onClick={createPost}
        className="btn-gold w-full mt-4 py-3"
      >
        Post
      </button>
    </div>
  );
  /* ----------------------------------------------------
     BUSINESS STORY BUBBLES — startup-style
     Represents: New Idea, Funding Progress, Vendor Work, NDA Signed, etc.
  ---------------------------------------------------- */
  const storyBubbles = [
    { label: "Add Story", icon: "➕", color: "border-gold/60 text-gold" },
    { label: "New Idea", icon: "💡", color: "border-blue-400/40 text-blue-300" },
    { label: "Funding", icon: "💼", color: "border-yellow-400/40 text-yellow-300" },
    { label: "Vendor Work", icon: "🔧", color: "border-purple-400/40 text-purple-300" },
    { label: "Update", icon: "📈", color: "border-green-400/40 text-green-300" },
    { label: "NDA", icon: "🧾", color: "border-red-400/40 text-red-300" },
  ];

  const StorySection = () => (
    <div className="flex overflow-x-auto gap-4 py-4 px-4 mt-4 no-scrollbar">
      {storyBubbles.map((s, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className={`
              w-16 h-16 rounded-full border-2 flex items-center justify-center
              bg-white/10 backdrop-blur-xl shadow-md ${s.color}
            `}
          >
            <span className="text-xl">{s.icon}</span>
          </div>
          <p className="text-xs mt-1 text-gray-300">{s.label}</p>
        </div>
      ))}
    </div>
  );

  /* ----------------------------------------------------
     BUSINESS CATEGORY TABS — chosen mix
  ---------------------------------------------------- */
  const CategoryTabs = () => (
    <div className="flex gap-3 px-4 mt-2 overflow-x-auto no-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setCategory(cat.id)}
          className={`
            px-4 py-2 rounded-lg text-sm font-bold border whitespace-nowrap
            ${
              category === cat.id
                ? "bg-gold text-black border-gold"
                : "bg-white/5 border-gold/20 text-gray-300"
            }
          `}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
  /* ----------------------------------------------------
     LOAD POSTS — WITH CEO AUTO-PIN + CATEGORY FILTERS
  ---------------------------------------------------- */
  useEffect(() => {
    const loadPosts = async () => {
      const q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(10)
      );

      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const now = Date.now();

      /* Separate pinned posts (CEO only) */
      const pinned = list.filter(
        (p) => p.pinnedUntil && p.pinnedUntil > now
      );

      /* Regular posts */
      const regular = list.filter(
        (p) => !p.pinnedUntil || p.pinnedUntil <= now
      );

      setPinnedPosts(pinned);
      setPosts(regular);

      /* Save last post for infinite scroll */
      setLastPost(snap.docs[snap.docs.length - 1]);
    };

    loadPosts();
  }, []);

  /* ----------------------------------------------------
     LOAD MORE POSTS (Infinite Scroll)
  ---------------------------------------------------- */
  const loadMorePosts = async () => {
    if (!lastPost) return;

    setLoadingMore(true);

    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      startAfter(lastPost),
      limit(10)
    );

    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    setPosts((prev) => [...prev, ...list]);
    setLastPost(snap.docs[snap.docs.length - 1]);
    setLoadingMore(false);
  };

  /* ----------------------------------------------------
     OBSERVER — Infinite Scroll Trigger
  ---------------------------------------------------- */
  const handleScroll = useCallback((entries: any) => {
    if (entries[0].isIntersecting) {
      loadMorePosts();
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleScroll, { threshold: 1 });
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [handleScroll]);

  /* ----------------------------------------------------
     FILTER POSTS BY CATEGORY
  ---------------------------------------------------- */
  const filterPosts = (postList: any[]) => {
    if (category === "all") return postList;
    if (category === "trending") {
      return postList.filter((p) => (p.reactions?.length || 0) >= 3);
    }
    return postList.filter((p) => p.type === category);
  };

  /* ----------------------------------------------------
     ROLE LABELS FOR POSTS
  ---------------------------------------------------- */
  const roleLabel = (r: string) => {
    if (r === "creator") return "Creator";
    if (r === "investor") return "Investor";
    if (r === "vendor") return "Vendor";
    if (r === "lawyer") return "Lawyer";
    if (r === "ceo") return "👑 CEO • Founder";
    return "User";
  };
  /* ----------------------------------------------------
     ADD BUSINESS REACTION TO A POST
  ---------------------------------------------------- */
  const addReaction = async (postId: string, current: any[], emoji: string) => {
    if (!user) return;

    const newEntry = {
      userId: user.uid,
      emoji: emoji,
      time: Date.now(),
    };

    /* Append reaction */
    const updated = [...current, newEntry];

    await updateDoc(doc(db, "posts", postId), {
      reactions: updated,
    });

    /* Refresh */
    window.location.reload();
  };

  /* ----------------------------------------------------
     REACTION TOOLBAR COMPONENT
     Appears under each post
  ---------------------------------------------------- */
  const ReactionBar = ({ post }: any) => (
    <div className="flex gap-4 mt-3">
      {reactionList.map((r) => (
        <button
          key={r.icon}
          onClick={() => addReaction(post.id, post.reactions || [], r.icon)}
          className="
            text-xl hover:scale-125 transition-transform 
            bg-white/5 rounded-lg px-3 py-2 
            border border-gold/20
          "
          title={r.label}
        >
          {r.icon}
        </button>
      ))}

      {/* Reaction count */}
      {post.reactions?.length > 0 && (
        <span className="text-gray-300 text-sm ml-2">
          {post.reactions.length} reactions
        </span>
      )}
    </div>
  );
  /* ----------------------------------------------------
     POST CARD COMPONENT (Color-coded + Role Labels)
  ---------------------------------------------------- */
  const PostCard = ({ post }: any) => {
    const type = post.type || "idea";
    const style = typeStyles[type] || "border-white/20 bg-white/5";

    const isCeo = post.role === "ceo";

    return (
      <div
        className={`
          card mb-6 fade-in border 
          ${style}
          ${isCeo ? "shadow-[0_0_20px_rgba(212,175,55,0.4)] border-gold/50" : ""}
        `}
      >
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-3">
          {/* LEFT — Avatar + Role */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center 
                ${isCeo ? "bg-gold text-black" : "bg-white/10 text-gold"}
                border ${isCeo ? "border-gold" : "border-gold/20"}
              `}
            >
              {isCeo ? "👑" : post.userId?.slice(0, 2)?.toUpperCase()}
            </div>

            {/* User Info */}
            <div>
              <p
                className={`
                  font-bold 
                  ${isCeo ? "text-gold" : "text-white"}
                `}
              >
                {isCeo ? "👑 CEO • Founder" : roleLabel(post.role)}
              </p>
              <p className="text-xs text-gray-400">
                {timeAgo(post.createdAt)}
              </p>
            </div>
          </div>

          {/* RIGHT — Post Type Label */}
          <div
            className="
              px-3 py-1 rounded-lg text-xs font-bold 
              bg-white/5 border border-gold/20 text-gold
            "
          >
            {post.type === "idea" && "💡 Idea"}
            {post.type === "investor" && "💼 Investor Offer"}
            {post.type === "marketplace" && "🔧 Marketplace Work"}
            {post.type === "project" && "📈 Project Update"}
            {post.type === "legal" && "🧾 Legal / NDA"}
            {post.type === "trending" && "⭐ Trending"}
          </div>
        </div>

        {/* POST TEXT */}
        {post.text && (
          <p className="text-gray-200 mb-3 leading-relaxed whitespace-pre-line">
            {post.text}
          </p>
        )}

        {/* POST IMAGE */}
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            className="rounded-xl mb-3 border border-gold/30 max-h-[400px] object-cover w-full"
          />
        )}

        {/* REACTIONS */}
        <ReactionBar post={post} />

        {/* COMMENT INPUT */}
        <input
          type="text"
          placeholder="Write a comment…"
          className="input-glass mt-3"
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              const text = (e.target as any).value;
              if (!text.trim()) return;

              const newComment = {
                userId: user?.uid,
                text,
                time: Date.now(),
              };

              const updated = [...(post.comments || []), newComment];

              await updateDoc(doc(db, "posts", post.id), {
                comments: updated,
              });

              (e.target as any).value = "";
              window.location.reload();
            }
          }}
        />

        {/* COMMENTS LIST */}
        {post.comments?.length > 0 && (
          <div className="mt-3">
            <p className="text-gold font-bold mb-2">Comments</p>

            {post.comments.map((c: any, i: number) => (
              <div
                key={i}
                className="bg-white/5 border border-gold/10 rounded-lg p-2 mb-2"
              >
                <p className="text-sm">
                  <span className="text-gold font-bold">User:</span> {c.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ----------------------------------------------------
     FEED RENDERER — COMBINE PINNED + REGULAR POSTS
  ---------------------------------------------------- */
  const Feed = () => {
    const combined = [...pinnedPosts, ...posts];
    const visible = filterPosts(combined);

    if (visible.length === 0)
      return <p className="text-center text-gray-400 mt-8">No posts yet.</p>;

    return (
      <div className="max-w-2xl mx-auto mt-10">
        {visible.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {/* Infinite Scroll Trigger */}
        <div ref={bottomRef} className="h-10"></div>

        {loadingMore && (
          <p className="text-center text-gray-400 py-4">Loading more…</p>
        )}
      </div>
    );
  };
  /* ----------------------------------------------------
     FINAL PAGE RENDER
  ---------------------------------------------------- */
  return (
    <div className="min-h-screen bg-black text-white fade-in pb-20">

      {/* BUSINESS STORY BUBBLES */}
      <StorySection />

      {/* CATEGORY TABS */}
      <CategoryTabs />

      {/* CREATE POST BOX */}
      <CreatePostBox />

      {/* FEED */}
      <Feed />
    </div>
  );
}
