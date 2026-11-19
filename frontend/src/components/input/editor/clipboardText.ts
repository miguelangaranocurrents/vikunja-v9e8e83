import type {Fragment, Slice} from '@tiptap/pm/model'

const LIST_TYPES = ['bulletList', 'orderedList']

/**
 * Serializes a copied editor selection as plain text, keeping list markers
 * ("- " for bullets, "1. " for ordered items) so the text still reads as a list
 * when pasted outside the editor. Nested list items are indented under their marker.
 */
export function serializeSliceAsText(slice: Slice): string {
	return serializeBlocks(slice.content).join('\n')
}

function serializeBlocks(fragment: Fragment): string[] {
	const lines: string[] = []

	fragment.forEach(node => {
		if (LIST_TYPES.includes(node.type.name)) {
			node.forEach((item, _offset, index) => {
				const marker = node.type.name === 'orderedList' ? `${index + 1}. ` : '- '
				serializeBlocks(item.content).forEach((line, lineIndex) => {
					lines.push(lineIndex === 0 ? marker + line : ' '.repeat(marker.length) + line)
				})
			})
		} else if (node.isTextblock) {
			lines.push(node.textBetween(0, node.content.size, '\n', '\n'))
		} else if (node.isBlock) {
			lines.push(...serializeBlocks(node.content))
		} else {
			lines.push(node.textContent)
		}
	})

	return lines
}
