import { useReactiveVar } from '@apollo/client'
import { Breadcrumbs, useTheme, Typography } from '@mui/material'

import { localFoldersVar, localCollectionsVar } from 'src/contexts/reactives'

import { NodeItem } from './CollectionTree/Node'

type PanelBreadcrumbsProps = {
  item: NodeItem
}

export const PanelBreadcrumbs = ({ item }: PanelBreadcrumbsProps) => {
  const localCollections = useReactiveVar(localCollectionsVar)
  const localFolders = useReactiveVar(localFoldersVar)
  const theme = useTheme()

  // Function to recursively search parents
  const getItemChain = (item: NodeItem): JSX.Element[] => {
    if (item.__typename === 'LocalCollection') {
      return [
        <Typography
          variant="h6"
          key={`${item.__typename} ${item.id}`}
          color={theme.palette.text.primary}
        >
          {item.name}
        </Typography>,
      ]
    }

    const getParent = (parentId: string, __parentTypename: string) => {
      if (__parentTypename === 'LocalCollection') {
        return localCollections.find((folder) => folder.id === parentId)
      } else if (__parentTypename === 'LocalFolder') {
        return localFolders.find((folder) => folder.id === parentId)
      } else {
        throw `Unknown parent type ${__parentTypename}`
      }
    }

    const parent = getParent(item.parentId, item.__parentTypename)

    if (!parent) {
      throw `Could not find parent of ${item.__typename} ${item.id}`
    }

    return [
      ...getItemChain(parent),
      <Typography
        variant="h6"
        key={`${item.__typename} ${item.id}`}
        color={theme.palette.text.primary}
      >
        {item.name}
      </Typography>,
    ]
  }

  console.log(getItemChain(item))

  return <Breadcrumbs separator=">">{getItemChain(item)}</Breadcrumbs>
}
