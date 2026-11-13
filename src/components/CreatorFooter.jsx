const CREATOR = import.meta.env.VITE_CREATOR_NAME || 'Murodbek';

export default function CreatorFooter() {
  return <p className="creator">{CREATOR} tomonidan yaratilgan</p>;
}
