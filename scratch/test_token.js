const token = "AQU8gfoZNp5QggBqhP7_ueENUmL-VuErF0SlX8wAjf3gfgw_SiYSUqJxLxLRN7MZozG15DiHCAoaSkmp7E7m9kgaUhmK5Az4IHe4cknpe2lzHzW1P7oOxw7Qbn9QgHS0oQooC27CKoKfAfQ1uv5bbRcaesci460D2j2IvtSEJ7UFhNnUDWzQiKB4ukOJT1sy45y5_JQkeuWNx1SQwQHh0XwGV_RrnWb9j_4NHHhy9DHqGEJhksxp4evmAXsbB3KIb28CILozdCsAOz2duJrluyy9yLlRFexW3VdrMsSZv3OPqG3xQZEAzwhpevVb29P9k3Hogooo73D6SDslbUm5cMuMvCslqQ";
const orgId = "112470973";

async function test() {
  // Test 1: User info / Me
  const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log("Userinfo status:", meRes.status);
  if (meRes.ok) console.log("Me:", await meRes.json());
  else console.log("Me err:", await meRes.text());

  // Test 2: Follower stats
  const folRes = await fetch(`https://api.linkedin.com/rest/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${orgId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202401',
    }
  });
  console.log("Follower stats status:", folRes.status);
  console.log("Follower stats body:", await folRes.text());

  // Test 3: Share stats
  const shareRes = await fetch(`https://api.linkedin.com/rest/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${orgId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202401',
    }
  });
  console.log("Share stats status:", shareRes.status);
  console.log("Share stats body:", await shareRes.text());
}

test();
