const token = "AQU8gfoZNp5QggBqhP7_ueENUmL-VuErF0SlX8wAjf3gfgw_SiYSUqJxLxLRN7MZozG15DiHCAoaSkmp7E7m9kgaUhmK5Az4IHe4cknpe2lzHzW1P7oOxw7Qbn9QgHS0oQooC27CKoKfAfQ1uv5bbRcaesci460D2j2IvtSEJ7UFhNnUDWzQiKB4ukOJT1sy45y5_JQkeuWNx1SQwQHh0XwGV_RrnWb9j_4NHHhy9DHqGEJhksxp4evmAXsbB3KIb28CILozdCsAOz2duJrluyy9yLlRFexW3VdrMsSZv3OPqG3xQZEAzwhpevVb29P9k3Hogooo73D6SDslbUm5cMuMvCslqQ";

async function inspectToken() {
  // 1. What permissions/scopes does this token actually have?
  // We can check introspect endpoint or call different v2 endpoints
  const endpoints = [
    { name: "Me Profile", url: "https://api.linkedin.com/v2/userinfo" },
    { name: "My Email", url: "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))" },
    { name: "Organizations ACL", url: "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee" },
    { name: "Organization 112470973", url: "https://api.linkedin.com/rest/organizations/112470973" },
    { name: "Organization Lookup", url: "https://api.linkedin.com/v2/organizations/112470973" },
    { name: "Shares", url: "https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:organization:112470973" },
    { name: "Posts", url: "https://api.linkedin.com/rest/posts?author=urn%3Ali%3Aorganization%3A112470973&q=author" }
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202401',
        }
      });
      console.log(`[${ep.name}] Status: ${res.status}`);
      const text = await res.text();
      console.log(`[${ep.name}] Body: ${text.substring(0, 200)}`);
    } catch (e) {
      console.log(`[${ep.name}] Err: ${e.message}`);
    }
  }
}

inspectToken();
