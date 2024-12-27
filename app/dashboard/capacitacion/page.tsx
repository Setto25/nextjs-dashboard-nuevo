"use client";
import styled from "styled-components";
import { Tabs } from "@/app/components/tabs";

export default function Page() {
    return     <Container>
          <Tabs />
        </Container>;
  }
  
  const Container = styled.main`
  height: 100vh;
`;
