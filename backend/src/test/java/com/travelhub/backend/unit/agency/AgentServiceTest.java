package com.travelhub.backend.unit.agency;

import com.travelhub.backend.entity.Agent;
import com.travelhub.backend.repository.AgentRepository;
import com.travelhub.backend.repository.BookingRepository;
import com.travelhub.backend.service.AgentRatingCalculator;
import com.travelhub.backend.service.AgentService;
import com.travelhub.backend.service.PackageService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.testng.MockitoTestNGListener;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

@Listeners(MockitoTestNGListener.class)
public class AgentServiceTest {

    @Mock
    private AgentRepository agentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PackageService packageService;

    @Mock
    private AgentRatingCalculator agentRatingCalculator;

    @InjectMocks
    private AgentService agentService;

    @Test(description = "getApprovedAgents should return only approved and active agents")
    public void getApprovedAgents_ShouldReturnApprovedActiveAgents() {
        // All agents returned — filtering done in service
        when(agentRepository.findAll()).thenReturn(List.of());
        when(agentRatingCalculator.getAgentRatings(anyList())).thenReturn(Map.of());

        var result = agentService.getApprovedAgents();

        assertNotNull(result);
        assertTrue(result.isEmpty()); // no agents set up = empty result
        verify(agentRepository, times(1)).findAll();
    }

    @Test(description = "getApprovedAgents with agents should return matching DTOs")
    public void getApprovedAgents_WithApprovedAgent_ShouldReturnResult() {
        com.travelhub.backend.entity.User owner = com.travelhub.backend.entity.User.builder()
                .id(1L)
                .agentApproved(true)
                .build();
        Agent agent = Agent.builder()
                .id(10L)
                .agencyName("Sri Lanka Tours")
                .isActive(true)
                .owner(owner)
                .build();

        when(agentRepository.findAll()).thenReturn(List.of(agent));
        when(agentRatingCalculator.getAgentRatings(anyList())).thenReturn(Map.of(10L, 4.5));
        when(bookingRepository.countByAgentIdAndStatus(eq(10L), anyString())).thenReturn(5L);
        when(packageService.getPackagesByAgentId(10L)).thenReturn(List.of());

        var result = agentService.getApprovedAgents();

        assertEquals(result.size(), 1);
        assertEquals(result.get(0).getAgencyName(), "Sri Lanka Tours");
    }
}
