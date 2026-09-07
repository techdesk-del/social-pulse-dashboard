const token = "AQU8gfoZNp5QggBqhP7_ueENUmL-VuErF0SlX8wAjf3gfgw_SiYSUqJxLxLRN7MZozG15DiHCAoaSkmp7E7m9kgaUhmK5Az4IHe4cknpe2lzHzW1P7oOxw7Qbn9QgHS0oQooC27CKoKfAfQ1uv5bbRcaesci460D2j2IvtSEJ7UFhNnUDWzQiKB4ukOJT1sy45y5_JQkeuWNx1SQwQHh0XwGV_RrnWb9j_4NHHhy9DHqGEJhksxp4evmAXsbB3KIb28CILozdCsAOz2duJrluyy9yLlRFexW3VdrMsSZv3OPqG3xQZEAzwhpevVb29P9k3Hogooo73D6SDslbUm5cMuMvCslqQ";

async function testParams() {
  const org = "urn:li:organization:112470973";
  const encOrg = encodeURIComponent(org);
  
  const tests = [
    `https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=${org}`,
    `https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=${encOrg}`,
    `https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR`,
    `https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&roleAssignee=urn%3Ali%3Aperson%3A26IaaeltSJ`,
    `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${org}`,
    `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${encOrg}`,
    `https://api.linkedin.com/v2/organizationPageStatistics?q=organization&organization=${org}`,
    `https://api.linkedin.com/v2/organizationPageStatistics?q=organization&organization=${encOrg}`,
  ];

  for (const url of tests) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    console.log(url.substring(30, 85), "-> Status:", res.status);
    const body = await res.text();
    console.log("Body:", body.substring(0, 150));
  }
}

testParams();
