const createMailPage = (header, code) => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Gemsy</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f3f4f6; color:#000000;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; padding:20px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; padding:40px; text-align:center;">
            <tr>
              <td>
                <h1 style="color:#dd0303; font-size:28px; margin:0;">Welcome, ${
                  header
                }!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 0; font-size:16px; color:#333333;">
                <p>We’re excited to have you on board. Use the code below to verify your email:</p>
              </td>
            </tr>
            <tr>
              <td>
                <div style="display:inline-block; background-color:#dd0303; color:#ffffff; font-size:32px; font-weight:bold; padding:16px 32px; border-radius:12px; letter-spacing:4px;">
                  ${code}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding-top:20px; font-size:14px; color:#666666;">
                <p>If you didn’t sign up for Gemsy, you can safely ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="padding-top:10px; font-size:12px; color:#999999;">
                &copy; ${new Date().getFullYear()} Gemsy. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `
}

export default createMailPage;