const DOMAIN_URL = process.env.NEXT_PUBLIC_DOMAIN_URL || "maslent.site";
const PROTOCOL = DOMAIN_URL.includes("localhost") ? "http" : "https";

const apiConfig = {
  DOMAIN_URL,
  PROTOCOL,
};

module.exports = apiConfig;