import "@/styles/globals.scss";
import type { AppProps } from "next/app";
import { loginState, workspacestate } from "@/state";
import { RecoilRoot, useRecoilValue, useRecoilState } from "recoil";
import { pageWithLayout } from "@/layoutTypes";
import RecoilNexus, { setRecoil } from "recoil-nexus";
import { useEffect, useState } from "react";
import Router from "next/router";
import Head from "next/head";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from "chart.js";
import { themeState } from "../state/theme";

type AppPropsWithLayout = AppProps & {
  Component: pageWithLayout;
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

function ThemeHandler() {
  const theme = useRecoilValue(themeState);

  useEffect(() => {
    if (!theme) return;
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  return null;
}

function ColorThemeHandler() {
  const workspace = useRecoilValue(workspacestate);

  useEffect(() => {
    if (workspace?.groupTheme) {
      document.documentElement.style.setProperty("--group-theme", workspace.groupTheme);
    }
  }, [workspace]);

  return null;
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const [loading, setLoading] = useState(true);
  const Layout = Component.layout || (({ children }) => <>{children}</>);

  useEffect(() => {
    const checkLogin = async () => {
      let req;
      try {
        req = await axios.get("/api/@me");
      } catch (err: any) {
        if (err.response?.data.error === "Workspace not setup") {
          Router.push("/welcome");
          setLoading(false);
          return;
        }
        if (err.response?.data.error === "Not logged in") {
          Router.push("/login");
          setLoading(false);
          return;
        }
      } finally {
        if (req?.data) {
          setRecoil(loginState, {
            ...req.data.user,
            workspaces: req.data.workspaces,
          });
        }
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  return (
    <RecoilRoot>
      <Head>
        <title>Orbit</title>
      </Head>

      <ThemeHandler />
      <ColorThemeHandler />
      <RecoilNexus />

      {!loading ? (
        <Layout>
        <>
          {/* ✅ Global Maintenance Banner */}
          <div className="bg-yellow-100 text-yellow-900 dark:bg-yellow-200 dark:text-yellow-900 px-4 py-3 border-b border-yellow-300 text-sm font-medium">
            ⚠️ <strong>Incident Investigation:</strong> We're investigating a reported issue with User API and Workspaces. See updates at{" "}
            <a
              href="https://status.myhrhub.org/status/orbit"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-yellow-700"
            >
              status.myhrhub.org
            </a>
          </div>
      
          <Component {...pageProps} />
        </>
      </Layout>
      
      ) : (
        <div className="flex h-screen dark:bg-gray-900">
          <svg
            aria-hidden="true"
            className="w-24 h-24 text-gray-200 animate-spin dark:text-gray-600 fill-orbit my-auto mx-auto"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      )}
    </RecoilRoot>
  );
}

export default MyApp;
