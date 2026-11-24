const token = "AQU8gfoZNp5QggBqhP7_ueENUmL-VuErF0SlX8wAjf3gfgw_SiYSUqJxLxLRN7MZozG15DiHCAoaSkmp7E7m9kgaUhmK5Az4IHe4cknpe2lzHzW1P7oOxw7Qbn9QgHS0oQooC27CKoKfAfQ1uv5bbRcaesci460D2j2IvtSEJ7UFhNnUDWzQiKB4ukOJT1sy45y5_JQkeuWNx1SQwQHh0XwGV_RrnWb9j_4NHHhy9DHqGEJhksxp4evmAXsbB3KIb28CILozdCsAOz2duJrluyy9yLlRFexW3VdrMsSZv3OPqG3xQZEAzwhpevVb29P9k3Hogooo73D6SDslbUm5cMuMvCslqQ";

async function test() {
  const endpoints = [
    "https://api.linkedin.com/v2/organizations/112470973",
    "https://api.linkedin.com/v2/organizations?ids=List(112470973)",
    "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee",
    "https://api.linkedin.com/v2/organizationFollowers?q=organization&organization=urn:li:organization:112470973",
    "https://api.linkedin.com/v2/networkSizes/urn:li:organization:112470973?edgeType=CompanyFollowedByMember",
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Restli-Protocol-Version': '2.0.0',
        }
      });
      console.log(ep, "-> Status:", res.status);
      const text = await res.text();
      if (res.ok) console.log("SUCCESS:", text);
      else console.log("ERR:", text.substring(0, 150));
    } catch (e) {
      console.log(ep, "ERROR:", e.message);
    }
  }
}

test();
