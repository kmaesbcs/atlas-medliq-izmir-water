export interface Story {
  title: string;
  slug: string;
  location: string;
  mapSound: string;
  backgroundSound: string;
  sections: StorySection[];
  materials?: {
    files?: StoryLink[],
    links?: StoryLink[],
  }
}

export interface StorySection {
  text: string;
  files?: StoryLink[];
  links?: StoryLink[];
  images: StoryImage[];
  materialsSection?: boolean;
}

export interface StoryLink {
  url: string;
  title: string;
}

export interface StoryImage {
  image: string;
  mobileImage: string;
  video: string;
  mobileVideo: string;
  focus: string;
}