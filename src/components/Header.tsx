import Controls from './Controls';
import Views from './Views';

const Header = () => {
  return (
    <div className="flex justify-between border  bg-gray-600 items-center">
      <Views/>
      <Controls loc="top-right" />
    </div>
  );
};

export default Header;
