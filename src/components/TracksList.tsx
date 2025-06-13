import { TracksListItem } from '@/components/TracksListItem'
import { unknownTrackImageUri } from '@/constants/images'
import { useQueue } from '@/store/queue'
import { utilsStyles } from '@/styles'
import { useEffect, useRef } from 'react'
import { Animated, FlatList, FlatListProps, StyleSheet, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import TrackPlayer, { Track } from 'react-native-track-player'
import { QueueControls } from './QueueControls'

export type TracksListProps = Partial<FlatListProps<Track>> & {
	id: string
	tracks: Track[]
	hideQueueControls?: boolean
}

const ItemDivider = () => (
	<View style={{ ...utilsStyles.itemSeparator, marginVertical: 9, marginLeft: 60 }} />
)

export const TracksList = ({
	id,
	tracks,
	hideQueueControls = false,
	...flatlistProps
}: TracksListProps) => {
	const queueOffset = useRef(0)
	const { activeQueueId, setActiveQueueId } = useQueue()

	const bannerAnim = useRef(new Animated.Value(-10)).current // starts above view

	useEffect(() => {
		Animated.timing(bannerAnim, {
			toValue: 0,
			duration: 600,
			useNativeDriver: true,
		}).start()
	}, [])

	const handleTrackSelect = async (selectedTrack: Track) => {
		const trackIndex = tracks.findIndex((track) => track.url === selectedTrack.url)
		if (trackIndex === -1) return

		const isChangingQueue = id !== activeQueueId

		if (isChangingQueue) {
			const beforeTracks = tracks.slice(0, trackIndex)
			const afterTracks = tracks.slice(trackIndex + 1)

			await TrackPlayer.reset()
			await TrackPlayer.add(selectedTrack)
			await TrackPlayer.add(afterTracks)
			await TrackPlayer.add(beforeTracks)
			await TrackPlayer.play()

			queueOffset.current = trackIndex
			setActiveQueueId(id)
		} else {
			const nextTrackIndex =
				trackIndex - queueOffset.current < 0
					? tracks.length + trackIndex - queueOffset.current
					: trackIndex - queueOffset.current

			await TrackPlayer.skip(nextTrackIndex)
			TrackPlayer.play()
		}
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.container}>
				{/* 🎉 Animated Banner */}
				<Animated.View style={[styles.banner, { transform: [{ translateY: bannerAnim }] }]}>
					<Text style={styles.bannerText}>🎧 Welcome to Your Music Library</Text>
				</Animated.View>

				{/* Static Section Below Banner */}

				{/* Scrollable FlatList */}
				<FlatList
					style={styles.list}
					data={tracks}
					contentContainerStyle={{ padding: 20, paddingBottom: 128 }}
					ListHeaderComponent={
						!hideQueueControls ? (
							<QueueControls tracks={tracks} style={{ paddingBottom: 20 }} />
						) : undefined
					}
					ListFooterComponent={ItemDivider}
					ItemSeparatorComponent={ItemDivider}
					ListEmptyComponent={
						<View>
							<Text style={utilsStyles.emptyContentText}>No songs found</Text>
							<FastImage
								source={{ uri: unknownTrackImageUri, priority: FastImage.priority.normal }}
								style={utilsStyles.emptyContentImage}
							/>
						</View>
					}
					renderItem={({ item: track }) => (
						<TracksListItem track={track} onTrackSelect={handleTrackSelect} />
					)}
					{...flatlistProps}
				/>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#gfh',
	},
	container: {
		flex: 1,
	},
	banner: {
		padding: 16,
		backgroundColor: '#a6d3f4',
		alignItems: 'center',
		justifyContent: 'center',
	},
	bannerText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#003366',
	},
	header: {
		padding: 16,
		backgroundColor: '#f1f8f1',
		borderBottomWidth: 1,
		borderColor: '#ccc',
	},
	headerText: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	list: {
		flex: 1,
		paddingHorizontal: 16,
	},
})
