import { Resend } from "resend";
import { env } from "~/env";
import {
  renderEmailVerificationEmail,
  renderPasswordResetEmail,
  renderWelcomeEmail,
} from "./render";
import { FROM_EMAIL } from "../constants";

const resend = new Resend(env.RESEND_API_KEY);

interface WelcomeEmailParams {
  email: string;
  name: string;
}

export const sendWelcomeEmail = async (
  params: WelcomeEmailParams,
): Promise<void> => {
  try {
    const { html, text } = await renderWelcomeEmail(params.name);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.email,
      subject: "Welcome to t3-template!",
      html,
      text,
    });

    if (result.error) {
      console.error("[Email] [Welcome] Error:", result.error);
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error("[Email] Exception:", error);
    throw error;
  }
};

interface EmailVerificationParams {
  email: string;
  name: string;
  url: string;
}

export const sendEmailVerificationEmail = async (
  params: EmailVerificationParams,
): Promise<void> => {
  try {
    const { html, text } = await renderEmailVerificationEmail(
      params.name,
      params.url,
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.email,
      subject: "Verify your email address",
      html,
      text,
    });

    if (result.error) {
      console.error("[Email] [Email Verification] Error:", result.error);
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error("[Email] Exception:", error);
    throw error;
  }
};

interface PasswordResetParams {
  email: string;
  name: string;
  url: string;
}

export const sendPasswordResetEmail = async (
  params: PasswordResetParams,
): Promise<void> => {
  try {
    const { html, text } = await renderPasswordResetEmail(
      params.name,
      params.url,
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.email,
      subject: "Reset your password",
      html,
      text,
    });

    if (result.error) {
      console.error("[Email] [Password Reset] Error:", result.error);
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error("[Email] Exception:", error);
    throw error;
  }
};
