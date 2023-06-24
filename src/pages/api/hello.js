// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default async function handler(req, res) {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon/ditto")
  const json = await response.json()
  res.status(200).json(json)
}
