
export async function uploadToNftStorage(imageUrl: string, name: string, description: string) {
    const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    if (!jwt) throw new Error("Missing Pinata JWT");

    const res = await fetch(imageUrl);
    const blob = await res.blob();

    const formData = new FormData();
    formData.append("file", blob, "nft-image.png");

    const imageResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${jwt}`,
        }, 
        body: formData
    });

    const imageResult = await imageResponse.json();
    const imageCID = imageResult.IpfsHash;

    const metadata = {
        name,
        description,
        image: `ipfa://${imageCID}`,
    };

    const metadataResponse = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
    });

    const metadataResult = await metadataResponse.json();
    return `ipfs://${metadataResult.IpfsHash}`;
}