const requestNDA = async () => {
  if (!user) return alert("Login required.");

  // Create NDA request
  await addDoc(collection(db, "nda"), {
    creatorId: idea.creatorId,
    creatorEmail: idea.creatorEmail,

    viewerId: user.uid,
    viewerEmail: user.email,
    viewerName: user.email,

    ideaId: idea.id,
    ideaTitle: idea.title,

    pdfUrl: null,
    status: "pending",

    reviewedByLawyerId: null,
    lawyerNotes: null,

    createdAt: serverTimestamp(),
  });

  // 🔥 TRENDING SCORE UPDATE
  await updateDoc(doc(db, "ideas", idea.id), {
    ndaCount: (idea.ndaCount || 0) + 1,
  });

  alert("NDA request sent.");
};
