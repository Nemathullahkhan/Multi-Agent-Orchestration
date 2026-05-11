"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  FileJson,
  Folder,
  FolderOpen,
} from "lucide-react";

type FileNode = {
  id: string;
  name: string;
  type: "file" | "folder";
  extension?: string;
  content?: string;
  children?: FileNode[];
};

const layoutFile = String.raw`
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

const homePageFile = String.raw`
export default function HomePage() {
  return (
    <main className="p-10">
      <h1>Hello Next.js</h1>
    </main>
  );
}
`;

const dashboardPageFile = String.raw`
export default function DashboardPage() {
  return (
    <div>
      Dashboard
    </div>
  );
}
`;

const navbarFile = String.raw`
export default function Navbar() {
  return (
    <nav className="border-b p-4">
      Navbar
    </nav>
  );
}
`;

const packageJsonFile = String.raw`
{
  "name": "next-app",
  "version": "1.0.0",
  "private": true
}
`;

/* -------------------------------------------------------------------------- */
/*                                   TREE                                     */
/* -------------------------------------------------------------------------- */

const nextJsTree: FileNode[] = [
  {
    id: "1",
    name: "app",
    type: "folder",
    children: [
      {
        id: "2",
        name: "layout.tsx",
        type: "file",
        extension: "tsx",
        content: layoutFile,
      },
      {
        id: "3",
        name: "page.tsx",
        type: "file",
        extension: "tsx",
        content: homePageFile,
      },
      {
        id: "4",
        name: "dashboard",
        type: "folder",
        children: [
          {
            id: "5",
            name: "page.tsx",
            type: "file",
            extension: "tsx",
            content: dashboardPageFile,
          },
        ],
      },
    ],
  },

  {
    id: "6",
    name: "components",
    type: "folder",
    children: [
      {
        id: "7",
        name: "Navbar.tsx",
        type: "file",
        extension: "tsx",
        content: navbarFile,
      },
    ],
  },

  {
    id: "8",
    name: "package.json",
    type: "file",
    extension: "json",
    content: packageJsonFile,
  },
];

/* -------------------------------------------------------------------------- */
/*                                   ICONS                                    */
/* -------------------------------------------------------------------------- */

function getFileIcon(extension?: string) {
  switch (extension) {
    case "tsx":
    case "ts":
    case "js":
    case "jsx":
      return <FileCode2 className="h-4 w-4 text-blue-400" />;

    case "json":
      return <FileJson className="h-4 w-4 text-yellow-400" />;

    default:
      return <FileCode2 className="h-4 w-4 text-zinc-400" />;
  }
}

/* -------------------------------------------------------------------------- */
/*                                TREE NODE                                   */
/* -------------------------------------------------------------------------- */

type TreeNodeProps = {
  node: FileNode;
  level?: number;
  selectedFile: FileNode | null;
  onSelect: (file: FileNode) => void;
};

function TreeNode({ node, level = 0, selectedFile, onSelect }: TreeNodeProps) {
  const [open, setOpen] = useState(true);

  const isFolder = node.type === "folder";

  const isActive = selectedFile?.id === node.id && node.type === "file";

  function handleClick() {
    if (isFolder) {
      setOpen((prev) => !prev);
      return;
    }

    onSelect(node);
  }

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-zinc-800 ${
          isActive ? "bg-zinc-800" : ""
        }`}
        style={{
          paddingLeft: `${level * 14 + 10}px`,
        }}
      >
        {isFolder ? (
          open ? (
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-500" />
          )
        ) : (
          <div className="w-4" />
        )}

        {isFolder ? (
          open ? (
            <FolderOpen className="h-4 w-4 text-yellow-400" />
          ) : (
            <Folder className="h-4 w-4 text-yellow-400" />
          )
        ) : (
          getFileIcon(node.extension)
        )}

        <span className="text-zinc-200">{node.name}</span>
      </div>

      {isFolder &&
        open &&
        node.children?.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            level={level + 1}
            selectedFile={selectedFile}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              FILE SYSTEM                                   */
/* -------------------------------------------------------------------------- */

export default function FileSystem() {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(
    nextJsTree[0]?.children?.[1] ?? null,
  );

  return (
    <div className="grid h-full grid-cols-[280px_1fr] overflow-hidden border border-zinc-800 bg-zinc-950 text-white">
      {/* SIDEBAR */}

      <div className="border-r border-zinc-800">
        <div className="border-b border-zinc-800 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Explorer
          </h2>
        </div>

        <div className="space-y-1 p-2">
          {nextJsTree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              selectedFile={selectedFile}
              onSelect={setSelectedFile}
            />
          ))}
        </div>
      </div>

      {/* EDITOR */}

      <div className="flex flex-col">
        {/* TOP BAR */}

        <div className="flex h-12 items-center border-b border-zinc-800 bg-zinc-900 px-4">
          <span className="text-sm text-zinc-300">
            {selectedFile?.name ?? "No file selected"}
          </span>
        </div>

        {/* MONACO */}

        <div className="flex-1">
          <Editor
            beforeMount={(monaco) => {
              monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions(
                {
                  noSemanticValidation: true,
                  noSyntaxValidation: true,
                },
              );

              monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
                {
                  noSemanticValidation: true,
                  noSyntaxValidation: true,
                },
              );
            }}
            height="100%"
            theme="vs-dark"
            language={
              selectedFile?.extension === "json" ? "json" : "typescript"
            }
            value={selectedFile?.content ?? ""}
            options={{
              minimap: {
                enabled: false,
              },

              fontSize: 14,
              automaticLayout: true,
              wordWrap: "on",
              scrollBeyondLastLine: false,

              padding: {
                top: 16,
              },

              quickSuggestions: false,

              parameterHints: {
                enabled: false,
              },

              suggestOnTriggerCharacters: false,

              acceptSuggestionOnEnter: "off",

              wordBasedSuggestions: "off",

              renderValidationDecorations: "off",
            }}
          />
        </div>
      </div>
    </div>
  );
}
