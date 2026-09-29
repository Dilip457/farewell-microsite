// ------------------------------------------------------------------
// "Say something back" — where the colleagues' replies are delivered.
//
// This uses a Google Form that YOU own (free, no server needed):
//
//   1. Go to https://forms.google.com and create a new blank form.
//      Add exactly two questions:
//        - "Your name"     (short answer)
//        - "Your message"  (paragraph)
//   2. Press the purple PUBLISH button in the top-right of the editor —
//      an unpublished form requires sign-in for everyone else!
//   3. In the form editor, open the ⋮ menu (top right) and choose
//      "Get pre-filled link". Type anything in both questions and
//      press "Get link". Copy the link it shows.
//   4. From that link, fill the three values below:
//        formAction   = the link up to (and including) "/viewform",
//                       with "viewform" replaced by "formResponse"
//                       e.g. "https://docs.google.com/forms/d/e/ABCD…/formResponse"
//        nameEntry    = the "entry.123456789" id that followed your name answer
//        messageEntry = the "entry.987654321" id that followed your message answer
//   5. Replies arrive under the form's "Responses" tab. Tip: press
//      "Link to Sheets" there to keep every reply in a spreadsheet.
//
// The message box on the site stays HIDDEN until formAction and
// messageEntry are filled in.
// ------------------------------------------------------------------

export const feedback = {
  formAction:
    "https://docs.google.com/forms/d/e/1FAIpQLSe1mbZBqCm-K6pqCYLlofk9Is-MeruTSSbIEr3u5eGFdkooNA/formResponse",
  nameEntry: "entry.1535415317", // "Your name"
  messageEntry: "entry.1449516189", // "Your message"
};
