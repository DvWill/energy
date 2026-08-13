export const OPEN_LEAD_CHAT_EVENT = "energy:open-lead-chat";

export function openLeadChat() {
  window.dispatchEvent(new Event(OPEN_LEAD_CHAT_EVENT));
}
