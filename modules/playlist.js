
/* const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
 */
const playlist = [
    'assets/music/chinese-temple.mp3',
    'assets/music/fantasy.mp3'
];

let currentTrackIndex = 0;

export function loadTrack(trackIndex) {
    const audioPlayer = document.getElementById('myAudioPlayer');
    if (trackIndex >= 0 && trackIndex < playlist.length) {
        audioPlayer.src = playlist[trackIndex];
        audioPlayer.play();
        currentTrackIndex = trackIndex;
    }
}

/* 
audioPlayer.addEventListener('ended', () => {
    loadTrack(currentTrackIndex + 1);
});

nextButton.addEventListener('click', () => {
  loadTrack((currentTrackIndex + 1) % playlist.length);
});

prevButton.addEventListener('click', () => {
  loadTrack((currentTrackIndex - 1 + playlist.length) % playlist.length); });
  
loadTrack(0);
*/