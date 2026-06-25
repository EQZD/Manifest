const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

const SECRET = process.env.SECRET || '';

app.post('/send', async (req, res) => {
  if (SECRET) {
    const authHeader = req.headers['x-secret'];

    if (authHeader !== SECRET) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Unauthorized' });
    }
  }

  const {
    from_email,
    from_password,
    to_email,
    subject,
    html,
  } = req.body;

  if (!from_email || !from_password || !to_email) {
    return res.status(400).json({
      status: 'error',
      message:
        'Missing required fields: from_email, from_password, to_email',
    });
  }

  const password = from_password.replace(/\s/g, '');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: from_email,
      pass: password,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: from_email,
      to: to_email,
      subject: subject || '(no subject)',
      html: html || '',
    });

    return res.json({
      status: 'ok',
      messageId: info.messageId,
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
});

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`SMTP service running on port ${PORT}`);
});