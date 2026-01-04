import { Image } from "antd";
const Screen = ({ style, children, width, image }) => {
  const phoneWidth = width ?? 200;
  const phoneHeight = width * 1.25;
  return (
    <div
      style={{
        backgroundImage: `url("${process.env.NEXT_PUBLIC_BASE_PATH}/image/object/screen.png")`,
        width: phoneWidth,
        height: phoneHeight,
        backgroundPosition: "center",
        backgroundSize: "cover",
        display: "flex",
        ...style,
      }}
    >
      {image ? (
        <Image
          style={{
            width: phoneWidth,
            height: phoneHeight * 0.45,
            margin: "30% 0.5%",
            borderRadius: 5,
          }}
          src={image}
        ></Image>
      ) : (
        <div style={{ margin: "auto" }}>{children}</div>
      )}
    </div>
  );
};

export default Screen;
