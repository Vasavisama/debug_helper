const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAnswerNotification = async (receiverEmail, questionTitle, questionId) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: receiverEmail,
    subject: "New Answer to Your Question - DebugHelper",
    html: `
      <h3>Your question has a new answer!</h3>
      <p>Someone posted a solution to your question:</p>
      <b>${questionTitle}</b>
      <br><br>
      <a href="http://localhost:5173/question/${questionId}">
        View Answer
      </a>
      <br><br>
      <p>DebugHelper Platform</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendAnswerNotification;
