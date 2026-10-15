declare module "*.geojson" {
  const value: {
    type: "FeatureCollection";
    features: {
      type: "Feature";
      properties: Record<string, string>;
      geometry: { type: "Polygon"; coordinates: number[][][] };
    }[];
  };
  export default value;
}
