const token = "AQU8gfoZNp5QggBqhP7_ueENUmL-VuErF0SlX8wAjf3gfgw_SiYSUqJxLxLRN7MZozG15DiHCAoaSkmp7E7m9kgaUhmK5Az4IHe4cknpe2lzHzW1P7oOxw7Qbn9QgHS0oQooC27CKoKfAfQ1uv5bbRcaesci460D2j2IvtSEJ7UFhNnUDWzQiKB4ukOJT1sy45y5_JQkeuWNx1SQwQHh0XwGV_RrnWb9j_4NHHhy9DHqGEJhksxp4evmAXsbB3KIb28CILozdCsAOz2duJrluyy9yLlRFexW3VdrMsSZv3OPqG3xQZEAzwhpevVb29P9k3Hogooo73D6SDslbUm5cMuMvCslqQ";

async function testVersions() {
  const versions = ['202404', '202407', '202410', '202501', '202502'];
  for (const v of versions) {
    const res = await fetch('https://api.linkedin.com/rest/posts?author=urn%3Ali%3Aorganization%3A112470973&q=author', {
      headers: {
        Authorization: `Bearer ${token}`,
        'LinkedIn-Version': v,
        'X-Restli-Protocol-Version': '2.0.0',
      }
    });
    console.log(`Version ${v}: Status ${res.status}`);
    const t = await res.text();
    console.log(`Body: ${t.substring(0, 100)}`);
  }
}

testVersions();
