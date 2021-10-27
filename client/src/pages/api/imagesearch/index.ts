import { NextApiRequest, NextApiResponse } from "next";

const imageSearch = async (req: NextApiRequest, res: NextApiResponse) => {
  const getBingSearchResults = async () => {
    const options = [];
    // options.push("mkt=de-DE");
    options.push("SafeSearch=Strict");
    options.push("aspect=all");
    options.push("count=8");

    const query = req.query.term;
    if (typeof query === "string") {
      const queryUrl = `https://api.bing.microsoft.com/v7.0/images/search/?q=${encodeURIComponent(
        query
      )}&${options.join("&")}`;
      const response = await fetch(queryUrl, {
        headers: new Headers({
          "Ocp-Apim-Subscription-Key": "<YOUR_SUBSCRIPTION_KEY>",
          Accept: "application/json",
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        return res.status(response.status).json(json);
      }

      const images = json.value.map((image: any) => {
        return { thumbnailUrl: image.thumbnailUrl, url: image.contentUrl };
      });
      return res.json(images);
    } else {
      return res.status(200).json({});
    }
  };

  return await getBingSearchResults();
};

export default imageSearch;
