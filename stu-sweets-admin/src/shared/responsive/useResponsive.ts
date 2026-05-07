import { Grid } from "antd";

const { useBreakpoint } = Grid;

export const useResponsive = () => {
  const screens = useBreakpoint();

  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  return {
    screens,
    isMobile,
    isTablet,
    isDesktop,
  };
};