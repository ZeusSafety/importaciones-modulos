import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve("."),
  },
  serverExternalPackages: ["jspdf", "jspdf-autotable"],
  outputFileTracingIncludes: {
    "/api/requerimientos-logistica/[id]/pdf": ["./public/images/logo-zeus-safety-blanco.png"],
  },
};

export default nextConfig;
