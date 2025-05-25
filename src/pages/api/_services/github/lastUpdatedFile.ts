import { GITHUB_ACCESS_TOKEN } from 'astro:env/server'

interface LastUpdatedTimeData {
  lastUpdatedTime: string
  latestCommitUrl: string
}

const getLastUpdatedTimeByFile = async (
  filePath: string
): Promise<LastUpdatedTimeData | null> => {
  const API_URL = `https://api.github.com/repos/lynntheophene/web/commits?`

  const params = new URLSearchParams({
    path: `src/content/${filePath}`,
    per_page: '1'
  }).toString()

  const response = await fetch(API_URL + params, {
    headers: { Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}` }
  })

  if (!response.ok) {
    // Handle fetch error
    return null
  }

  const dataArr = await response.json()
  if (!Array.isArray(dataArr) || dataArr.length === 0) {
    // No commits found for this file
    return null
  }

  const [data] = dataArr

  return {
    lastUpdatedTime: data.commit.committer.date,
    latestCommitUrl: data.html_url
  }
}

export default getLastUpdatedTimeByFile
