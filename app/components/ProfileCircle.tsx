export default function ProfileCircle({
  name = "Agent",
  size = 50,
}: {
  name?: string;
  size?: number;
}) {
  return (
    <div>
      <p
        className={`profile-circle bg-terra`}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        {name.substring(0, 1)}
      </p>
    </div>
  );
}
