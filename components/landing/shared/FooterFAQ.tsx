import { Accordion } from "@/components/ui";
import { FAQ_DATA } from "../contact/ContactFAQ";

export default function FooterFAQ() {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-3">
        Câu hỏi thường gặp
      </h3>
      <Accordion
        variant="dark"
        items={FAQ_DATA.map((faq) => ({
          title: faq.question,
          content: faq.answer,
        }))}
      />
    </div>
  );
}
