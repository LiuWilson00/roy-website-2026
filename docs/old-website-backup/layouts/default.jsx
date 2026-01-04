import { Layout } from "antd";
import styles from "./style.module.scss";
import { useRouter } from "next/dist/client/router";
import { useTranslation } from "next-i18next";
import { useState, useEffect } from "react";
import Logo from "../components/Logo";

const { Header, Footer, Sider, Content } = Layout;
function Default({ children }) {
  const { t } = useTranslation("common");
  const [currentKey, setCurrentKey] = useState(1);
  const router = useRouter();

  const menu = [
    {
      text: "HOME",
      href: "/",
      key: 1,
      anchor: true,
    },
    {
      text: "PROFESSIONAL",
      href: "professional",
      key: 2,
      anchor: true,
    },
    {
      text: "EXPERIENCE",
      href: "experience",
      key: 3,
      anchor: true,
    },
    {
      text: "PORTFOLIO",
      href: "/portfolio",
      key: 4,
    },
    {
      text: "CONTACT",
      href: "contact",
      key: 5,
      anchor: true,
    },
  ];
  useEffect(() => {
    // console.log(window.location.pathname);

    const currentMenu = menu.find((m) => {
      const regString = `[\\\/.]?\\${m.href}$`;
      console.log(
        m.href,
        regString,
        window.location.pathname,
        RegExp(regString).test(window.location.pathname)
      );
      return RegExp(regString).test(window.location.pathname);
    });

    if (currentMenu) {
      setCurrentKey(currentMenu.key);
    }
  }, [typeof window !== "undefined" ? window?.location?.pathname : false]);
  const renderMenu = (m) => {
    const toAnchor = () => {
      if (
        window.location.pathname !== process.env.NEXT_PUBLIC_BASE_PATH &&
        window.location.pathname !== `${process.env.NEXT_PUBLIC_BASE_PATH}/en`
      ) {
        window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH}/#${m.href}`;
      } else {
        const elementToScrollTo = document.getElementById(m.href);
        elementToScrollTo?.scrollIntoView({
          behavior: "smooth",
        });
      }
    };

    return (
      <div
        className={`${styles.menuItem} ${
          currentKey == m.key ? styles.selected : ""
        }`}
        key={m.key}
        onClick={() => {
          if (m.anchor) {
            toAnchor();
          } else {
            router.push(m.href);
          }
        }}
      >
        {m.text}
      </div>
    );
  };

  return (
    <div className={styles.defaultLayout} style={{ margin: "0 auto" }}>
      <Layout>
        <Header>
          <Logo
            onClick={() => {
              router.push("/");
            }}
          ></Logo>
          <div className={styles.menu}>{menu.map((m) => renderMenu(m))}</div>
        </Header>
        <Content>{children}</Content>
        {/* {children} */}
      </Layout>
    </div>
  );
}

export default Default;
