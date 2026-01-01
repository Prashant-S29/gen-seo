import { render } from "@react-email/render";
import {
  EmailVerification,
  WelcomeEmail,
  PasswordResetEmail,
} from "~/components/email";

export async function renderWelcomeEmail(userName: string) {
  const html = await render(<WelcomeEmail userName={userName} />);
  const text = await render(<WelcomeEmail userName={userName} />, {
    plainText: true,
  });

  return { html, text };
}

export async function renderEmailVerificationEmail(
  userName: string,
  url: string,
) {
  const html = await render(
    <EmailVerification userName={userName} url={url} />,
  );
  const text = await render(
    <EmailVerification userName={userName} url={url} />,
    {
      plainText: true,
    },
  );

  return { html, text };
}

export async function renderPasswordResetEmail(userName: string, url: string) {
  const html = await render(
    <PasswordResetEmail userName={userName} url={url} />,
  );
  const text = await render(
    <PasswordResetEmail userName={userName} url={url} />,
    {
      plainText: true,
    },
  );

  return { html, text };
}
