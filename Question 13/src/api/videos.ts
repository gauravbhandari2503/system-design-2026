export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  duration: number; // in seconds
  views: string;
  uploadedAt: string;
  author: {
    name: string;
    avatar: string;
    subscribers: string;
  };
}

const SAMPLE_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'Big Buck Bunny',
    description: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself. When one sunny day three rodents rudely harass him, something snaps... and the bunny ain\'t no bunny anymore! In the typical cartoon tradition he prepares the nasty rodents a comical revenge.',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/800px-Big_buck_bunny_poster_big.jpg',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 596,
    views: '12M',
    uploadedAt: '2008',
    author: {
      name: 'Blender Foundation',
      avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Blender_logo_no_text.svg/600px-Blender_logo_no_text.svg.png',
      subscribers: '1.2M'
    }
  },
  {
    id: '2',
    title: 'Elephant Dream',
    description: 'The first Blender Open Movie from 2006.',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Elephants_Dream_poster.jpg/800px-Elephants_Dream_poster.jpg',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: 653,
    views: '8.5M',
    uploadedAt: '2006',
    author: {
      name: 'Blender Foundation',
      avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Blender_logo_no_text.svg/600px-Blender_logo_no_text.svg.png',
      subscribers: '1.2M'
    }
  },
  {
    id: '3',
    title: 'For Bigger Blazes',
    description: 'HBO GO now works with Chromecast.',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: 15,
    views: '1.2M',
    uploadedAt: '1 year ago',
    author: {
        name: 'Google',
        avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/600px-Google_%22G%22_Logo.svg.png',
        subscribers: '100M'
    }
  },
  {
    id: '4',
    title: 'For Bigger Escapes',
    description: 'Introducing Chromecast. The easiest way to enjoy online video and music on your TV.',
    thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: 15,
    views: '2.4M',
    uploadedAt: '1 year ago',
    author: {
        name: 'Google',
        avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/600px-Google_%22G%22_Logo.svg.png',
        subscribers: '100M'
    }
  },
   {
    id: '5',
    title: 'Tears of Steel',
    description: 'Tears of Steel was realized with crowd-funding by users of the open source 3D creation tool Blender. Target was to improve the open source 3D pipeline for visual effects in film.',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Tears_of_Steel_poster.jpg/800px-Tears_of_Steel_poster.jpg',
    url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: 734,
    views: '5M',
    uploadedAt: '2012',
    author: {
      name: 'Blender Foundation',
      avatar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Blender_logo_no_text.svg/600px-Blender_logo_no_text.svg.png',
      subscribers: '1.2M'
    }
  }
];

export const VideoService = {
  getVideos(): Promise<Video[]> {
      return Promise.resolve(SAMPLE_VIDEOS);
  },
  getVideo(id: string): Promise<Video | undefined> {
      return Promise.resolve(SAMPLE_VIDEOS.find(v => v.id === id));
  },
  getRelatedVideos(id: string): Promise<Video[]> {
      return Promise.resolve(SAMPLE_VIDEOS.filter(v => v.id !== id));
  }
}
