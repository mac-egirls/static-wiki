import { Client, cacheExchange, fetchExchange } from "@urql/core";
import { graphql } from "../gql";

const client = new Client({
  url: "https://wiki.egirls.dev/graphql",
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => {
    const token = process.env.WIKIJS_KEY;
    if (!token) {
      throw new Error("No token found");
    }
    return {
      headers: { authorization: token ? `Bearer ${token}` : "" },
    };
  },
});

export default client;

export async function getAllPages() {
  const query = graphql(/* GraphQL */ `
    query QueryPages {
      pages {
        list {
          id
          path
        }
      }
    }
  `);

  const { data } = await client.query(query, {}).toPromise();

  return data.pages.list.map((page) => ({ path: page.path, id: page.id }));
}

export async function getPage(pageId: number) {
  const query = `
  query GetPaths($id:Int!) {
    pages {
      single(id: $id) {
        id
        title
        description
        render
      }
    }
  }
  `;

  const res = await client.query(query, { id: pageId }).toPromise();
  const data: SinglePageData = res.data;
  return data.pages.single;
}

interface SinglePageData {
  pages: {
    single: {
      id: number;
      title: string;
      description: string;
      render: string;
    };
  };
}

export async function getPathTree(path: string) {}
