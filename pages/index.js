import { Head } from "next/head";
import styles from "../styles/Home.module.css";
import { Toolbar } from "../components/toolbar";
import imageUrlBuilder from "@sanity/image-url";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { datadogRum } from "@datadog/browser-rum";

datadogRum.init({
  applicationId: "a0c1760d-b5e1-48fe-8a99-a60b93098905",
  clientToken: "pub7dd881ed062312465ebd1c1047064a3b",
  site: "datadoghq.com",
  service: "todo",
  // Specify a version number to identify the deployed version of your application in Datadog
  // version: '1.0.0',
  sampleRate: 100,
  trackInteractions: true,
});

export default function Home({ posts }) {
  const router = useRouter();
  const [mappedPosts, setMappedPosts] = useState([]);

  useEffect(() => {
    if (posts.length) {
      const imgBuilder = imageUrlBuilder({
        projectId: "8wvntxkh",
        dataset: "production",
      });

      setMappedPosts(
        posts.map((p) => {
          return {
            ...p,
            mainImage: imgBuilder.image(p.mainImage).width(500).height(250),
            revalidate: 1,
          };
        })
      );
    } else {
      setMappedPosts([]);
    }
  }, [posts]);

  return (
    <div>
      <Toolbar />
      <div className={styles.main}>
        <h2>I travel so you don&apos;t have to...</h2>

        <div className={styles.feed}>
          {mappedPosts.length ? (
            mappedPosts.map((p, index) => (
              <div
                onClick={() => router.push(`/post/${p.slug.current}`)}
                key={index}
                className={styles.post}
              >
                <h3>{p.title}</h3>
                <img
                  className={styles.mainImage}
                  src={p.mainImage}
                  alt='description'
                />
              </div>
            ))
          ) : (
            <>No Posts Yet</>
          )}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = async (pageContext) => {
  const query = encodeURIComponent('*[ _type == "post" ]');
  const url = `https://8wvntxkh.api.sanity.io/v1/data/query/production?query=${query}`;
  const result = await fetch(url).then((res) => res.json());

  if (!result.result || !result.result.length) {
    return {
      props: {
        posts: [],
      },
    };
  } else {
    return {
      props: {
        posts: result.result,
      },
    };
  }
};
