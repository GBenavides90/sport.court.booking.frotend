import React from 'react';
import WifiIcon from '@mui/icons-material/Wifi';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import ShowerIcon from '@mui/icons-material/Shower';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WcIcon from '@mui/icons-material/Wc';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import TvIcon from '@mui/icons-material/Tv';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SecurityIcon from '@mui/icons-material/Security';
import StadiumIcon from '@mui/icons-material/Stadium';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ICON_MAP = {
  wifi: WifiIcon,
  parking: LocalParkingIcon,
  shower: ShowerIcon,
  lockers: CheckroomIcon,
  lighting: LightbulbIcon,
  cafe: LocalCafeIcon,
  water: WaterDropIcon,
  restroom: WcIcon,
  ac: AcUnitIcon,
  tv: TvIcon,
  firstaid: MedicalServicesIcon,
  security: SecurityIcon,
  bleachers: StadiumIcon,
  equipment: FitnessCenterIcon,
};

export default function FeatureIcon({ name, ...props }) {
  const normalized = (name || '').toLowerCase().trim();
  const IconComponent = ICON_MAP[normalized] || CheckCircleOutlineIcon;
  return <IconComponent {...props} />;
}
