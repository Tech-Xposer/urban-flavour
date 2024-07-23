export const userVerificationTemplate = (name, verificationLink) => {
  return {
    subject: "User Verfication",
    html: `
          <h2>Greetings of the day!</h2>
          <h3><b>Dear ${name}, </br> Please verify your email address by clicking <a href=${verificationLink} target='__blank'>here</a>.</b></h3>
          <br> ${verificationLink}
          <p><b>Note:</b> This link will expire after 30 minutes.</p>
          <p><strong>Caution:</strong> Please do not share this email with anyone for security reasons. This link is unique to your account and should not be shared.</p>
          <p>If you did not register for an account with us, please ignore this email.</p>
          <p><h3>Thanks,</h3><h3>Team NexBid</h3></p>`,
  };
};

export const userPasswordResetTemplate = (name, resetLink) => {
  return {
    subject: "Password Reset",
    html: `
          <h2>Greetings of the day!</h2>
          <h3><b>Dear ${name}, </br> Please reset your password by clicking <a href=${resetLink} target='__blank'>here</a>.</b></h3>
          <br> ${resetLink}
          <p><b>Note:</b> This link will expire after 30 minutes.</p>
          <p>Send your password in body</p>
          <p><strong>Caution:</strong> Please do not share this email with anyone for security reasons. This link is unique to your account and should not be shared.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p><h3>Thanks,</h3><h3>Team NexBid</h3></p>`,
  };
};
