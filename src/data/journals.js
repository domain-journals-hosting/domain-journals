const journals = [
  "Domain health journal",
  "Domain journal of science and technology",
  "Domain journal of biological sciences",
  "Domain multidisciplinary journal",
];

export const slug  = (title) =>
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
      
export default journals;
