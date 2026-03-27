declare module "react-simple-maps" {
  import { ComponentType, SVGProps } from "react";

  interface ProjectionConfig {
    rotate?: [number, number, number];
    center?: [number, number];
    scale?: number;
  }

  interface ComposableMapProps extends SVGProps<SVGSVGElement> {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
  }

  interface GeographiesChildrenProps {
    geographies: GeographyType[];
  }

  interface GeographiesProps {
    geography: string;
    children: (data: GeographiesChildrenProps) => React.ReactNode;
  }

  interface GeographyType {
    rsmKey: string;
    id: string;
    properties: Record<string, unknown>;
  }

  interface GeographyStyleState {
    outline?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    filter?: string;
    cursor?: string;
    [key: string]: unknown;
  }

  interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: GeographyType;
    style?: {
      default?: GeographyStyleState;
      hover?: GeographyStyleState;
      pressed?: GeographyStyleState;
    };
  }

  interface MarkerProps extends SVGProps<SVGGElement> {
    coordinates: [number, number];
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const ZoomableGroup: ComponentType<{
    center?: [number, number];
    zoom?: number;
    children?: React.ReactNode;
  }>;
}
