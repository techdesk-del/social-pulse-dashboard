const token = "AQU8gfoZNp5QggBqhP7_ueENUmL-VuErF0SlX8wAjf3gfgw_SiYSUqJxLxLRN7MZozG15DiHCAoaSkmp7E7m9kgaUhmK5Az4IHe4cknpe2lzHzW1P7oOxw7Qbn9QgHS0oQooC27CKoKfAfQ1uv5bbRcaesci460D2j2IvtSEJ7UFhNnUDWzQiKB4ukOJT1sy45y5_JQkeuWNx1SQwQHh0XwGV_RrnWb9j_4NHHhy9DHqGEJhksxp4evmAXsbB3KIb28CILozdCsAOz2duJrluyy9yLlRFexW3VdrMsSZv3OPqG3xQZEAzwhpevVb29P9k3Hogooo73D6SDslbUm5cMuMvCslqQ";

async function testV2() {
  const v2Endpoints = [
    "https://api.linkedin.com/v2/me",
    "https://api.linkedin.com/v2/userinfo",
    "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee",
    "https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:112470973",
    "https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:112470973",
    "https://api.linkedin.com/v2/organizationPageStatistics?q=organization&organization=urn:li:organization:112470973"
  ];

  for (const url of v2Endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Restli-Protocol-Version': '2.0.0',
        }
      });
      console.log(`${url.split('?')[0]} -> Status: ${res.status}`);
      const t = await res.text();
      console.log(`Response: ${t.substring(0, 160)}`);
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }
  }
}

testV2();
