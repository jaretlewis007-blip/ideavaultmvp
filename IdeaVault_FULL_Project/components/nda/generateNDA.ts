export function createNDA(recipient: string, owner: string, idea: string, date: string) {
  return `
NON-DISCLOSURE AGREEMENT (NDA)

This NDA is made on ${date} between:

Disclosing Party: ${owner}
Receiving Party: ${recipient}

1. Purpose:
   The Disclosing Party will share confidential information related to: 
   "${idea}"

2. Confidentiality Obligations:
   - Receiving Party agrees not to share or use the information outside of allowed purpose.
   - Information must not be disclosed to third parties.

3. Term:
   This NDA is effective as of the date above and lasts indefinitely.

4. Governing Law:
   This agreement is governed by applicable laws of the relevant jurisdiction.

Signed,

___________________________
${owner}

___________________________
${recipient}
  `;
}
