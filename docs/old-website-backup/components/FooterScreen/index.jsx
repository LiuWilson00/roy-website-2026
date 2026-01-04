import styles from "./style.module.scss";
import Logo from "../Logo";
import ConactCard from "../ConactCard";
import { useEffect, useState } from "react";
const FooterScreen = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  const scrollHandler = (el) => {
    const scrollTop = el.target.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    // const targetHeight = expRef.current.offsetTop;
    const windowHeight = document.documentElement.offsetHeight;

    if (scrollTop >= scrollHeight - windowHeight) {
      setIsScrolled(true);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", scrollHandler);
    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, []);

  return (
    <>
      <div className={styles.footerScreen}>
        <ConactCard style={{ opacity: isScrolled ? 1 : 0 }}></ConactCard>
        <div
          className={styles.background}
          style={{
            background: `url("${process.env.NEXT_PUBLIC_BASE_PATH}/image/index/programmer.jpg")`,
          }}
        ></div>
        <div className={styles.mask}></div>
      </div>
      <div className={styles.footer}>
        <div className={styles.footerContainer}>
          <Logo></Logo>
          <div className={styles.footerText}>
            © 2021 by Roy Liu. I especially add this line because it looks more
            professional
          </div>
        </div>
      </div>
    </>
  );
};

export default FooterScreen;
