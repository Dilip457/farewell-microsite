// ------------------------------------------------------------------
// "Say something back" — where the colleagues' replies are delivered.
//
// This uses a Google Form that YOU own (free, no server needed):
//
//   1. Go to https://forms.google.com and create a new blank form.
//      Add exactly two questions:
//        - "Your name"     (short answer)
//        - "Your message"  (paragraph)
//   2. In the form editor, open the ⋮ menu (top right) and choose
//      "Get pre-filled link". Type anything in both questions and
//      press "Get link". Copy the link it shows.
//   3. From that link, fill the three values below:
//        formAction   = the link up to (and including) "/viewform",
//                       with "viewform" replaced by "formResponse"
//                       e.g. "https://docs.google.com/forms/d/e/ABCD…/formResponse"
//        nameEntry    = the "entry.123456789" id that followed your name answer
//        messageEntry = the "entry.987654321" id that followed your message answer
//   4. Replies arrive under the form's "Responses" tab. Tip: press
//      "Link to Sheets" there to keep every reply in a spreadsheet.
//
// The message box on the site stays HIDDEN until formAction and
// messageEntry are filled in, so it is safe to deploy this half-done.
// ------------------------------------------------------------------

export const feedback = {
  formAction: "", // e.g. "https://docs.google.com/forms/d/e/XXXX…/formResponse"
  nameEntry: "", // e.g. "entry.1111111111" (set to "" to send no name)
  messageEntry: "", // e.g. "entry.2222222222"
};
