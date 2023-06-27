import React, { useState } from "react";

function normalizeUrl(url: string): string {
  // Remove the ".html" extension from paths ending in "index.html" or "*.html"
  let path = url;
  if (path.endsWith("index.html")) {
    path = path.slice(0, -10); // Remove "index.html" from the end
  } else if (path.endsWith(".html")) {
    path = path.slice(0, -5); // Remove ".html" from the end
  }

  // add the leading "/" from the path
  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  // remove the trailing "/" from the path
  if (path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path ? path : "/";
}

function findImmediateChildren(
  parent: string,
  paths: string[]
): { to: string; folder: boolean }[] {
  const parentWithSlash =
    normalizeUrl(parent) === "/" ? "/" : normalizeUrl(parent) + "/";
  console.log("Looking for children of", parentWithSlash);
  const immediateChildren = paths
    .map((path) => {
      const normalizedPath = normalizeUrl(path);
      return normalizedPath.startsWith(parentWithSlash) ? normalizedPath : null;
    })
    .filter((path) => path !== null) as string[];

  // count number of slashes in parent
  const numSlashes = parentWithSlash.split("/").length;

  // remove the parent from the beginning of each path, and get just the next level
  const nextLevel = immediateChildren.map((path) => {
    let parentAndChild = path.split("/").splice(0, numSlashes);
    console.log(numSlashes, parentAndChild);
    return parentAndChild.join("/");
  });

  // remove duplicates and sort
  const links = [...new Set(nextLevel)].sort();

  // for each link, check if it has an index
  const linksWithFolder = links.map((link) => {
    const isFolder = !paths.includes(link);
    return { to: link, folder: isFolder };
  });

  return linksWithFolder;
}

function getParent(url: string): string {
  const path = normalizeUrl(url);
  const parts = path.split("/");
  parts.pop();

  return normalizeUrl(parts.join("/"));
}

function isPage(url: string, paths: string[]): boolean {
  return paths.includes(url);
}

function isFolder(url: string, paths: string[]): boolean {
  return paths.some((path) => path.startsWith(url + "/"));
}

interface NavLinkProps {
  to: string;
  updator?: (to: string) => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, updator }) => {
  if (updator === undefined) {
    return <a href={`${to}`}>{to}</a>;
  }

  return (
    <button
      onClick={() => {
        updator(to);
      }}
    >
      {to}
    </button>
  );
};

interface NavProps {
  pages: string[];
}

const Nav: React.FC<NavProps> = (props) => {
  const [navPath, setNavPath] = useState(
    normalizeUrl(window.location.pathname)
  );

  let children = [];
  if (isPage(navPath, props.pages) && !isFolder(navPath, props.pages)) {
    children = findImmediateChildren(getParent(navPath), props.pages);
  } else {
    children = findImmediateChildren(navPath, props.pages);
  }

  console.log("Currently on", navPath);
  console.log("Children", children);
  console.log("Parent", getParent(navPath));

  return (
    <div className="p-4">
      <h1 className="py-2 text-2xl font-bold">Naviation</h1>

      <ul>
        <li>
          <NavLink to={getParent(navPath)} updator={setNavPath} />
        </li>
        {children.map((child) => (
          <li key={child.to}>
            <NavLink
              to={child.to}
              updator={child.folder ? setNavPath : undefined}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Nav;
