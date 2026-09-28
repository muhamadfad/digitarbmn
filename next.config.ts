import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXTAUTH_SECRET: "digitar-bmn-super-secret-key-2026-production",
  },
  allowedDevOrigins: [
    "lblue-125-163-41-29.run.pinggy-free.link",
    "bobka-125-163-41-29.free.pinggy.net"
  ]
};

export default nextConfig;
