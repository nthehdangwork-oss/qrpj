import { designs } from "./designs";
import { contentSchema, type CardContent } from "./rules";
import { catalog } from "./catalog";

export const layoutNames = {
  fullscreen: "Toàn màn hình",
  scroll: "Cuộn dọc",
  slides: "Chạm / vuốt chuyển trang",
} as const;
const extraPresets: Record<string, Partial<CardContent>> = {
  "couple-5": {
    recipient: "Người thương",
    headline: "Mình có một cuộc hẹn dưới ánh trăng",
    message:
      "Dành một buổi tối cho nhau nhé. Mình muốn cùng bạn đi dạo, kể những chuyện nhỏ và cất thêm một kỷ niệm thật đẹp.",
    sealText: "HẸN HÒ",
    eventDate: "19:00 · Tối thứ Bảy",
    eventLocation: "Quán quen của chúng mình",
    anniversaryDays: 0,
    giftRevealed:
      "Một buổi tối chỉ dành cho hai đứa, cùng món tráng miệng bạn thích nhất.",
  },
  "couple-6": {
    recipient: "Gia đình và bạn bè",
    sender: "Cô dâu & Chú rể",
    headline: "Ngày của chúng mình",
    message:
      "Trân trọng mời bạn đến chung vui trong ngày chúng mình nên duyên. Sự hiện diện của bạn là món quà quý giá nhất.",
    sealText: "WE DO",
    eventDate: "17:30 · Ngày vui của chúng mình",
    eventLocation: "Khu vườn hạnh phúc",
    anniversaryDays: 0,
    giftRevealed: "",
  },
  "family-5": {
    recipient: "Ông bà kính yêu",
    sender: "Các con và các cháu",
    headline: "Một đời yêu thương, một nhà hạnh phúc",
    message:
      "Kính chúc ông bà luôn mạnh khỏe, an vui. Cả nhà mong được quây quần bên ông bà, cùng nghe chuyện xưa và viết tiếp những ngày thật đẹp.",
    sealText: "KÍNH MỪNG",
    eventDate: "11:00 · Chủ nhật",
    eventLocation: "Ngôi nhà thân thương",
  },
  "family-6": {
    recipient: "Cả nhà mình",
    sender: "Người luôn mong cả nhà về",
    headline: "Về nhà ăn cơm nhé!",
    message:
      "Mâm cơm đã có những món cả nhà thích. Gác lại một chút bận rộn, mình cùng về ngồi bên nhau và kể chuyện một tuần đã qua nhé.",
    sealText: "NHÀ",
    eventDate: "18:30 · Cuối tuần",
    eventLocation: "Bên mâm cơm gia đình",
  },
  "occasion-5": {
    recipient: "Người bạn sắp tốt nghiệp",
    headline: "Một chặng đường mới đang chờ bạn",
    message:
      "Chúc mừng bạn đã bền bỉ đi tới ngày hôm nay. Mong hành trình phía trước có thật nhiều cơ hội, những người bạn tốt và niềm vui được làm điều mình yêu.",
    sealText: "TỎA SÁNG",
    eventDate: "Sau buổi lễ tốt nghiệp",
    eventLocation: "Sân trường thân quen",
    giftRevealed:
      "Một cái ôm thật chặt và lời chúc: hãy tự tin đi theo ước mơ!",
  },
  "occasion-6": {
    recipient: "Bạn và những người thân yêu",
    headline: "Một buổi tiệc nhỏ, thật nhiều niềm vui",
    message:
      "Mời bạn đến cùng chúng mình ăn ngon, chuyện trò và lưu lại những bức ảnh thật vui. Chỉ cần mang theo nụ cười của bạn!",
    sealText: "JOIN US",
    eventDate: "18:00 · Tối thứ Bảy",
    eventLocation: "Khu vườn cuối phố",
    giftRevealed: "Một lời chúc may mắn và một phần bánh ngọt đang đợi bạn.",
  },
};

export function templateContent(id: string): CardContent {
  const t = catalog.find((item) => item.id === id) ?? catalog[0];
  const birthday = id === "occasion-3";
  const couple = t.category === "COUPLE";
  const tet = id === "occasion-1";
  return contentSchema.parse({
    pageTitle: t.name,
    recipient:
      id === "family-1"
        ? "Mẹ kính yêu"
        : id === "family-2"
          ? "Bố kính yêu"
          : couple
            ? "Bé Yêu Hoàng Yến 🌸"
            : t.category === "FAMILY"
              ? "Ba Mẹ Kính Yêu"
              : tet
                ? "Gia Đình Thân Thương"
                : birthday
                  ? "Bạn Thân Tri Kỷ ✨"
                  : "Người Bạn Trân Quý",
    sender: couple
      ? "Một người luôn thương em"
      : t.category === "FAMILY"
        ? "Con của Ba Mẹ"
        : "Người gửi trao thương mến",
    message: birthday
      ? "Chúc bạn một tuổi mới ngập tràn niềm vui, vạn sự hanh thông và nụ cười rạng rỡ luôn nở trên môi. Cảm ơn vì đã luôn là người bạn tuyệt vời!"
      : couple
        ? "Cảm ơn em đã xuất hiện và biến mỗi ngày bình thường của anh thành những khoảnh khắc diệu kỳ nhất. Nhìn nụ cười của em, anh biết trái tim mình đã tìm được nơi bình yên để thuộc về."
        : tet
          ? "Kính chúc cả nhà năm mới an khang thịnh vượng, vạn sự như ý, lộc xuân tấn tới và đầm ấm sum vầy!"
          : t.category === "FAMILY"
            ? "Cảm ơn Ba Mẹ đã luôn là điểm tựa bình yên nhất trong cuộc đời con. Kính chúc Ba Mẹ luôn mạnh khỏe, an vui mỗi ngày."
            : "Một dịp đặc biệt, một lời chúc chân thành gửi đến bạn. Mong những điều ngọt ngào nhất sẽ đến với bạn hôm nay!",
    background: t.palette,
    icon: t.icon,
    animation: "float",
    imageUrl: "",
    musicUrl: "",

    sealText: couple
      ? "FOREVER"
      : t.category === "FAMILY"
        ? "TRI ÂN"
        : tet
          ? "TÀI LỘC"
          : "HAPPY",
    musicTitle: couple
      ? "Until I Found You"
      : birthday
        ? "Happy Birthday Melodies"
        : tet
          ? "Khúc Hát Khai Xuân"
          : "Giai Điệu Bình Yên",
    anniversaryDays: couple ? 520 : 0,
    giftRevealed: birthday
      ? "Tada! 1 Năm hạnh phúc vô điều kiện & 365 ngày cười rạng rỡ! 🎂"
      : tet
        ? "Lộc Vàng Đại Cát: 888.888đ may mắn & 365 ngày vạn sự như ý! 🧧"
        : couple
          ? "Phiếu quà tặng đặc biệt: 100 cái ôm & một chuyến đi Đà Lạt cùng nhau! ♡"
          : "",
    layout: ["poem", "cinema", "scrapbook", "yearbook"].includes(
      designs[t.id].id,
    )
      ? "slides"
      : [
            "celestial",
            "postcard",
            "heritage",
            "lunar",
            "winter",
            "birthday",
            "graduation",
            "ticket",
            "botanical",
          ].includes(designs[t.id].id)
        ? "fullscreen"
        : "scroll",
    theme: couple
      ? "romantic"
      : t.category === "FAMILY"
        ? "botanical"
        : "editorial",
    eventDate: "",
    eventLocation: "",
    ...extraPresets[t.id],
    design: designs[t.id].id,
    headline: designs[t.id].headline,
    envelope: designs[t.id].id === "wax",
    sections: [
      {
        id: "story",
        kind: "text",
        title: extraPresets[t.id]
          ? "Lời nhắn dành riêng bạn"
          : couple
            ? "Khoảnh khắc đầu tiên"
            : "Lời nhắn từ trái tim",
        text:
          extraPresets[t.id]?.message ??
          (couple
            ? "Dù sau này cuộc đời có qua bao mùa giông bão hay bình minh dịu ngọt, mình vẫn luôn ở đây để nắm thật chặt tay bạn."
            : "Có những điều giản dị mà mình luôn muốn giữ: một lần ngồi cạnh nhau, một tiếng cười, một ngày được trở về bên người thương."),
        imageUrl: "",
      },
      {
        id: "memory",
        kind: "photo",
        title: "Bức ảnh kỷ niệm ngọt ngào",
        text: "Nụ cười của bạn là điều rực rỡ nhất sưởi ấm cả những ngày lạnh.",
        imageUrl: "",
      },
      {
        id: "letter",
        kind: "message",
        title: "Hẹn ước yêu thương",
        text: "Cảm ơn vì đã luôn đồng hành cùng nhau trong từng chặng đường ý nghĩa.",
        imageUrl: "",
      },
    ],
  });
}
