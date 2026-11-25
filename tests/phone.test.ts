import { describe, expect, it } from "vitest";
import { formatPhone, normalizePhone, toWhatsAppNumber, whatsAppLink } from "@/lib/phone";

describe("normalizePhone", () => {
  it("accepte un mobile algérien avec espaces, points ou tirets", () => {
    expect(normalizePhone("0555 12 34 56")).toBe("0555123456");
    expect(normalizePhone("0555.12.34.56")).toBe("0555123456");
    expect(normalizePhone("0555-12-34-56")).toBe("0555123456");
  });

  it("accepte les formats internationaux", () => {
    expect(normalizePhone("+213 555 12 34 56")).toBe("+213555123456");
    expect(normalizePhone("00213555123456")).toBe("00213555123456");
  });

  it("refuse ce qui n'est pas un numéro", () => {
    expect(normalizePhone("12")).toBeNull();
    expect(normalizePhone("05551234ab")).toBeNull();
    expect(normalizePhone("")).toBeNull();
  });
});

describe("toWhatsAppNumber", () => {
  it("convertit un numéro local en numéro algérien international", () => {
    expect(toWhatsAppNumber("0555123456")).toBe("213555123456");
  });

  it("retire le + ou le 00 d'un numéro international", () => {
    expect(toWhatsAppNumber("+33612345678")).toBe("33612345678");
    expect(toWhatsAppNumber("0033612345678")).toBe("33612345678");
  });
});

describe("whatsAppLink", () => {
  it("encode le message dans le lien", () => {
    expect(whatsAppLink("0555123456", "Bonjour, j'ai une question.")).toBe(
      "https://wa.me/213555123456?text=Bonjour%2C%20j'ai%20une%20question.",
    );
  });
});

describe("formatPhone", () => {
  it("espace un numéro local par paires", () => {
    expect(formatPhone("0555123456")).toBe("0555 12 34 56");
  });

  it("laisse un numéro international tel quel", () => {
    expect(formatPhone("+213555123456")).toBe("+213555123456");
  });
});
