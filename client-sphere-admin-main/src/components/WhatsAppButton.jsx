
const WHATSAPP_NUMBER = "916304003951";

export default function WhatsAppButton() {
  const message = encodeURIComponent(
    "Hello Samwad, I would like to know more about your courses."
  );

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Samwad on WhatsApp"
      title="Chat with us on WhatsApp"
      className="
        fixed bottom-5 right-5 z-[9999]
        flex h-14 w-14 items-center justify-center
        rounded-full bg-[#25D366] text-white
        shadow-lg
        transition-all duration-300
        hover:scale-110 hover:bg-[#20BA5A]
        sm:bottom-7 sm:right-7
      "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="h-8 w-8 fill-current"
        aria-hidden="true"
      >
        <path d="M16 .5C7.45.5.5 7.45.5 16c0 2.74.72 5.43 2.09 7.8L.5 31.5l7.89-2.07A15.43 15.43 0 0 0 16 31.5c8.55 0 15.5-6.95 15.5-15.5S24.55.5 16 .5Zm0 28.36c-2.38 0-4.72-.64-6.75-1.85l-.48-.28-4.68 1.23 1.25-4.56-.31-.5A12.84 12.84 0 1 1 16 28.86Zm7.05-9.61c-.39-.2-2.31-1.14-2.67-1.27-.36-.13-.62-.2-.88.2-.26.39-1.01 1.27-1.24 1.53-.23.26-.46.29-.85.1-.39-.2-1.65-.61-3.14-1.94-1.16-1.03-1.95-2.31-2.18-2.7-.23-.39-.02-.6.17-.79.17-.17.39-.46.59-.69.2-.23.26-.39.39-.65.13-.26.07-.49-.03-.69-.1-.2-.88-2.12-1.21-2.9-.32-.76-.65-.66-.88-.67l-.75-.01c-.26 0-.69.1-1.05.49-.36.39-1.37 1.34-1.37 3.26s1.4 3.78 1.6 4.04c.2.26 2.75 4.2 6.66 5.89.93.4 1.66.65 2.23.83.94.3 1.79.26 2.47.16.75-.11 2.31-.95 2.63-1.86.33-.91.33-1.69.23-1.86-.1-.16-.36-.26-.75-.46Z" />
      </svg>
    </a>
  );
}
