import * as React from "react";
import { Section, Text, Button } from "@react-email/components";

interface EmailVerificationProps {
  userName: string;
  url: string;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  userName,
  url,
}) => {
  return (
    <Section>
      <Text className="mb-4 text-base leading-relaxed text-[#ffffff]">
        Hey {userName},
      </Text>
      <Text className="mb-6 text-base leading-relaxed text-[#E2E2E2]">
        Please verify your email address.
      </Text>

      <Section className="my-5">
        <Button
          className="inline-block rounded-[6.6px] bg-[#E7E7E7] px-3 py-2 text-center text-sm font-medium text-[#000000] no-underline"
          href={url}
        >
          Verify
        </Button>
      </Section>

      <Text className="mb-6 text-base leading-relaxed text-[#E2E2E2]">
        If the button doesn&apos;t work, copy and paste the following link in
        your browser:
        <br />
        <br />
        {url}
      </Text>
    </Section>
  );
};
