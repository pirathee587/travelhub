package com.travelhub.backend.controller.agency;

import com.travelhub.backend.service.AgentService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.springframework.http.HttpStatus;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class AgencyControllerTest {

    @Mock
    private AgentService agentService;

    @InjectMocks
    private com.travelhub.backend.controller.AgentController agentController;

    @Test(description = "GET /api/agents should return 200 with approved agent list")
    public void getAllAgents_ShouldReturn200_WithAgentList() {
        // Actual method name in AgentController is getAllAgents() (not getApprovedAgents)
        when(agentService.getApprovedAgents()).thenReturn(List.of());

        var response = agentController.getAllAgents();

        assertEquals(response.getStatusCode(), HttpStatus.OK);
        assertNotNull(response.getBody());
        verify(agentService, times(1)).getApprovedAgents();
    }
}
